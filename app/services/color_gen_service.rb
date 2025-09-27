# frozen_string_literal: true

class ColorGenService
  # Public API: generate N distinct, harmonious colors.
  # Uses a candidate pool + greedy farthest-point selection in Lab space.
  #
  # Options:
  #   candidates: pool size (400–1000). More = more coverage, slower.
  #   min_delta_e: soft target; the greedy step maximizes spacing naturally.
  #   bands: lightness/saturation tracks to keep the set cohesive.
  #
  def big_palette(n = 100, seed: nil, candidates: 600, min_delta_e: 24,
                  bands: { light: [42, 54, 66, 72], sat: [68, 62, 58, 72] })
    raise ArgumentError, "n must be >= 1" if n < 1
    pool = build_candidate_pool(candidates, seed: seed, bands: bands)
    select_farthest_colors(pool, n, min_delta_e: min_delta_e)
  end

  # ----------------- internals -----------------

  # Build a harmonious candidate pool by low-discrepancy stepping over hue
  # and cycling through S/L bands.
  def build_candidate_pool(count, seed:, bands:)
    phi  = 0.618033988749895
    h0   = seed ? seed.to_f % 360.0 : rand * 360.0

    pool = []
    count.times do |i|
      h = (h0 + (i * phi * 360.0)) % 360.0
      # small blue-noise jitters to avoid rigid rings
      h += (rand * 2 - 1) * 6.0
      h %= 360.0

      s = bands[:sat][i % bands[:sat].length]
      l = bands[:light][(i * 2) % bands[:light].length]
      l = [[l + (rand * 2 - 1) * 3.0, 10].max, 90].min

      r, g, b = hsl_to_rgb(h, s, l)
      lab = rgb_to_lab(r, g, b)
      pool << {
        hex: rgb_to_hex(r, g, b),
        rgb: [r, g, b],
        hsl: [h.round(2), s, l.round(1)],
        text: readable_text_color(r, g, b),
        lab: lab
      }
    end
    pool
  end

  # Greedy farthest-point: start with the most “chromatic” candidate, then
  # repeatedly pick the color that maximizes the minimum ΔE to the set.
  # This guarantees progress and avoids infinite loops.
  def select_farthest_colors(pool, n, min_delta_e:)
    raise "Candidate pool too small" if pool.empty?

    # Choose a strong starter: highest Lab chroma
    start_idx, _ =
      pool.each_with_index.map { |c, idx| [idx, Math.hypot(c[:lab][1], c[:lab][2])] }
          .max_by { |(_, chroma)| chroma }

    picked = [pool[start_idx]]
    remaining = pool.each_with_index.reject { |_, idx| idx == start_idx }.map(&:first)

    # Track each candidate’s distance to the picked set (min ΔE)
    min_dists = remaining.map { |c| [c, delta_e76(c[:lab], picked[0][:lab])] }.to_h

    while picked.size < n && !remaining.empty?
      # Pick the candidate with the largest min distance to the set
      next_c, next_d = min_dists.max_by { |(_, d)| d }
      picked << next_c

      break if remaining.size == 1 # nothing else to update

      # Remove it from remaining and update other min distances
      remaining.delete(next_c)
      min_dists.delete(next_c)
      remaining.each do |c|
        d = delta_e76(c[:lab], next_c[:lab])
        min_dists[c] = d if d < min_dists[c] # keep the min
      end

      # Optional: stop early if we already exceed the target spacing on average
      # (keeps it snappy on huge sets)
      # avg_min = min_dists.values.sum / min_dists.size
      # break if avg_min >= min_delta_e && picked.size >= n
    end

    # If we ran out (rare), just pad with the best of what’s left
    if picked.size < n
      leftovers = (remaining - picked).first(n - picked.size)
      picked.concat(leftovers)
    end

    picked.first(n).map { |c| c.reject { |k,_| k == :lab } }
  end

  # ---- helpers (same as your code) ----

  def hsl_to_rgb(h, s, l)
    h = h.to_f / 360.0
    s = s.to_f / 100.0
    l = l.to_f / 100.0
    if s.zero?
      v = (l * 255).round
      return [v, v, v]
    end
    q = l < 0.5 ? l * (1 + s) : l + s - l * s
    p = 2 * l - q
    r = hue_to_rgb(p, q, h + 1.0/3.0)
    g = hue_to_rgb(p, q, h)
    b = hue_to_rgb(p, q, h - 1.0/3.0)
    [(r * 255).round, (g * 255).round, (b * 255).round]
  end

  def hue_to_rgb(p, q, t)
    t += 1 if t < 0
    t -= 1 if t > 1
    return p + (q - p) * 6 * t if t < 1.0/6.0
    return q if t < 1.0/2.0
    return p + (q - p) * (2.0/3.0 - t) * 6 if t < 2.0/3.0
    p
  end

  def rgb_to_hex(r, g, b)
    format("#%02X%02X%02X", clamp8(r), clamp8(g), clamp8(b))
  end
  def clamp8(x) = [[x.to_i, 0].max, 255].min

  def readable_text_color(r, g, b)
    sr, sg, sb = [r, g, b].map { |v| v / 255.0 }.map { |c|
      c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    }
    luminance = 0.2126 * sr + 0.7152 * sg + 0.0722 * sb
    luminance > 0.179 ? "#000000" : "#FFFFFF"
  end

  def rgb_to_lab(r, g, b)
    rl, gl, bl = [r, g, b].map { |v|
      v = v / 255.0
      v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
    }
    x = rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375
    y = rl * 0.2126729 + gl * 0.7151522 + bl * 0.0721750
    z = rl * 0.0193339 + gl * 0.1191920 + bl * 0.9503041
    xr, yr, zr = x / 0.95047, y / 1.0, z / 1.08883
    fx = f_lab(xr); fy = f_lab(yr); fz = f_lab(zr)
    [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
  end

  def f_lab(t)
    t > 0.008856 ? t ** (1.0/3.0) : (7.787 * t) + (16.0 / 116.0)
  end

  def delta_e76(l1, l2)
    Math.sqrt((l1[0]-l2[0])**2 + (l1[1]-l2[1])**2 + (l1[2]-l2[2])**2)
  end
end
