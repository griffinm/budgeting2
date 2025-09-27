class MerchantGroupingService < BaseService
  def initialize(account_id:)
    @account = Account.find(account_id)
  end

  def suggest_groups_for_merchant(merchant)
    suggestions = []
    
    # Find merchants with similar names
    similar_merchants = find_similar_merchants(merchant)
    suggestions.concat(similar_merchants.map { |m| { merchant: m, reason: "Similar name", confidence: calculate_name_similarity(merchant.merchant_name, m.merchant_name) } })
    
    # Find merchants with same plaid entity pattern
    entity_pattern_merchants = find_entity_pattern_matches(merchant)
    suggestions.concat(entity_pattern_merchants.map { |m| { merchant: m, reason: "Same entity pattern", confidence: 0.8 } })
    
    # Find merchants with same location
    location_merchants = find_location_matches(merchant)
    suggestions.concat(location_merchants.map { |m| { merchant: m, reason: "Same location", confidence: 0.7 } })
    
    # Remove duplicates and sort by confidence
    suggestions.uniq { |s| s[:merchant].id }
               .reject { |s| s[:merchant].id == merchant.id }
               .sort_by { |s| -s[:confidence] }
  end

  def create_group_with_merchants(name:, description: nil, merchants:)
    return nil if merchants.empty?
    
    primary_merchant = merchants.first
    group = MerchantGroup.create!(
      account: @account,
      name: name,
      description: description,
      primary_merchant: primary_merchant
    )
    
    merchants.each do |merchant|
      group.add_merchant(merchant)
    end
    
    # Set the first merchant as primary
    group.set_primary_merchant(primary_merchant)
    
    group
  end

  def auto_group_similar_merchants(threshold: 0.8)
    grouped_merchants = []
    
    @account.merchants.where(merchant_group: nil).each do |merchant|
      next if grouped_merchants.include?(merchant.id)
      
      suggestions = suggest_groups_for_merchant(merchant)
      high_confidence_suggestions = suggestions.select { |s| s[:confidence] >= threshold }
      
      if high_confidence_suggestions.any?
        merchants_to_group = [merchant] + high_confidence_suggestions.map { |s| s[:merchant] }
        group_name = generate_group_name(merchants_to_group)
        
        group = create_group_with_merchants(
          name: group_name,
          description: "Auto-grouped similar merchants",
          merchants: merchants_to_group
        )
        
        grouped_merchants.concat(merchants_to_group.map(&:id))
      end
    end
    
    grouped_merchants
  end

  private

  def find_similar_merchants(merchant)
    return [] if merchant.merchant_name.blank?
    
    base_name = normalize_merchant_name(merchant.merchant_name)
    
    @account.merchants
            .where(merchant_group: nil)
            .where.not(id: merchant.id)
            .select do |m|
      normalized_name = normalize_merchant_name(m.merchant_name)
      calculate_name_similarity(base_name, normalized_name) > 0.6
    end
  end

  def find_entity_pattern_matches(merchant)
    return [] if merchant.plaid_entity_id.blank?
    
    # Extract pattern from plaid_entity_id (e.g., "starbucks_123" -> "starbucks")
    pattern = merchant.plaid_entity_id.split('_').first.downcase
    
    @account.merchants
            .where(merchant_group: nil)
            .where.not(id: merchant.id)
            .where("LOWER(plaid_entity_id) LIKE ?", "#{pattern}%")
  end

  def find_location_matches(merchant)
    return [] if merchant.city.blank? || merchant.state.blank?
    
    @account.merchants
            .where(merchant_group: nil)
            .where.not(id: merchant.id)
            .where(city: merchant.city, state: merchant.state)
  end

  def normalize_merchant_name(name)
    return "" if name.blank?
    
    name.downcase
        .gsub(/[^a-z0-9\s]/, '')
        .gsub(/\s+/, ' ')
        .strip
  end

  def calculate_name_similarity(name1, name2)
    return 0.0 if name1.blank? || name2.blank?
    
    # Handle exact matches
    return 1.0 if name1 == name2
    
    # Handle subset matches (one name contains the other)
    if name1.include?(name2) || name2.include?(name1)
      shorter_length = [name1.length, name2.length].min.to_f
      longer_length = [name1.length, name2.length].max.to_f
      ratio = shorter_length / longer_length
      
      # If the shorter name is at least 60% of the longer name, consider it highly similar
      if ratio >= 0.6
        return 0.9
      # If it's at least 40%, consider it moderately similar
      elsif ratio >= 0.4
        return 0.7
      else
        return ratio
      end
    end
    
    # Word-based similarity for other cases
    words1 = name1.split(' ')
    words2 = name2.split(' ')
    
    common_words = words1 & words2
    total_words = (words1 + words2).uniq.length
    
    return 0.0 if total_words == 0
    
    # Boost similarity if one name is mostly contained in the other
    if common_words.length > 0
      shorter_word_count = [words1.length, words2.length].min.to_f
      longer_word_count = [words1.length, words2.length].max.to_f
      
      # If most words from the shorter name are in the longer name, boost the score
      if common_words.length >= shorter_word_count * 0.8
        return [common_words.length.to_f / total_words, 0.8].max
      end
      
      # Special case: if names differ only by numbers or very small differences
      if common_words.length >= shorter_word_count * 0.6 && total_words <= 4
        # Check if the only differences are numbers or very short words
        diff_words1 = words1 - common_words
        diff_words2 = words2 - common_words
        
        # If all different words are numbers or very short (1-2 chars), boost similarity
        if (diff_words1 + diff_words2).all? { |word| word.match?(/^\d+$/) || word.length <= 2 }
          return 0.8
        end
      end
    end
    
    common_words.length.to_f / total_words
  end

  def generate_group_name(merchants)
    # Find the most common word in merchant names
    all_words = merchants.map { |m| normalize_merchant_name(m.merchant_name).split(' ') }.flatten
    word_counts = all_words.tally
    most_common_word = word_counts.max_by { |_, count| count }&.first
    
    if most_common_word && word_counts[most_common_word] > 1
      most_common_word.capitalize
    else
      merchants.first.merchant_name
    end
  end
end
