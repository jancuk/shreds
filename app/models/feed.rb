require 'uri'

class Feed < ActiveRecord::Base
  has_many :subscriptions, dependent: :destroy
  has_many :categories, through: :subscriptions
  has_many :users, through: :subscriptions
  has_many :newsitems, dependent: :destroy

  normalize_attributes :url
  validates :url, presence: true
  before_save :sanitize_url

  scope :for_nav, -> { order('url ASC') }

  def to_param
    "#{id}-#{(title.presence || '(untitled)').downcase.strip.gsub(/[\s[:punct:]]+/, '-')}"
  end

  def favicon
    url = URI.parse(self.url)
    "https://plus.google.com/_/favicon?domain=#{url.host || self.url}"
  end

  def up_to_date_with?(newfeed)
    etag.present? && (newfeed.etag == etag) && (!newsitems.empty?)
  end

  def add_newsitem(params)
    transaction do
      news = newsitems.build params
      news.save!
      subscriptions.each do |s|
        s.entries.build(newsitem: news).save!
      end
    end
  end

  def update_meta!(fields)
    fields.delete_if do |k, v|
      v.nil? ||
        (k == :title && title.present? && title == v) ||
        (k == :url && url.present? && url == v)
    end
    update_attributes!(fields) unless fields.empty?
  end

  private

  def sanitize_url
    url.prepend('http://') unless url.urlish?
  end
end

# == Schema Information
#
# Table name: feeds
#
#  id          :integer          not null, primary key
#  url         :text             not null
#  created_at  :datetime
#  updated_at  :datetime
#  category_id :integer
#  feed_url    :text
#  title       :text             default("( Untitled )"), not null
#  etag        :string(255)
#
# Indexes
#
#  index_feeds_on_category_id_and_id  (category_id,id) UNIQUE
#  index_feeds_on_feed_url            (feed_url) UNIQUE
#
