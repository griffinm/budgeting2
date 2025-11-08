# Pagy initializer file
# See https://ddnexus.github.io/pagy/docs/api/pagy

# Configure Pagy defaults
require 'pagy/extras/overflow'

Pagy::DEFAULT[:items] = 25
Pagy::DEFAULT[:max_items] = 10000
Pagy::DEFAULT[:overflow] = :last_page

