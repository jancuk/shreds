require 'uri'

class Feed < ActiveRecord::Base
  store :meta, accessors: [:title, :etag]

  belongs_to :category
  has_many :newsitems, :dependent => :destroy

  validates :url, presence: true

  default_scope -> { order('url ASC') }

  before_save :sanitize_url

  def to_param
    "#{id}-#{(title || '').downcase.strip.gsub(/[\s\/#\?\.]/, '-')}"
  end

  def favicon
    url = URI.parse(self.url)
    "https://plus.google.com/_/favicon?domain=#{url.host || self.url}"
  end

  def unread_newsitems
    newsitems.where(:unread => true)
  end

  def unread_count
    unread_newsitems.count
  end

  def mark_all_as_read
    counter = unread_count
    newsitems.each { |news| news.update(:unread => false) if news.unread }
    counter
  end

  def clear_read_news(offset = nil)
    offset ||= Kaminari.config.default_per_page
    newsitems.where(:unread => false) \
      .order('published DESC').offset(offset).destroy_all
  end

  def self.total_unread(feeds)
    feeds.reduce(0) {|count, feed| count + feed.unread_count }
  end

  def self.with_unread_newsitems
    joins(:newsitems).where('newsitems.unread = ?', true).group('feeds.id')
  end

  private

  def sanitize_url
    self.url.gsub!(/\s+/, '')
    self.url.prepend('http://') unless \
      url.start_with?('http://') || url.start_with?('https://')
  end
end
