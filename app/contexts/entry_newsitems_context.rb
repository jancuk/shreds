class EntryNewsitemsContext < BaseContext
  class_attribute :feed, :feed_record

  at_execution :process_entries

  def initialize(feed, feed_record)
    fail if feed.is_a? Fixnum # Got HTTP response code instead of Feed object ^^;
    fail if up_to_date?(feed, feed_record)
    self.feed, self.feed_record = [feed, feed_record]
  end

  def up_to_date?(feed, feed_record)
    (not feed_record.etag.nil?) && \
    (feed.etag == feed_record.etag) && \
    (not feed_record.newsitems.empty?)
  end

  private

  def process_entries
    feed.sanitize_entries!
    feed_record.update!(:title => feed.title, :etag => feed.etag, :url => feed.url)
    feed.entries.each do | entry |
      next unless Newsitem.where(permalink: entry.url).first.nil? && (not Itemhash.has? entry.url)
      feed_record.newsitems.build(newsitem_params(entry)).save!
    end
  end

  def newsitem_params(entry)
    ActionController::Parameters.new(
      :title     => entry.title,
      :permalink => entry.url,
      :published => entry.published,
      :content   => entry.content,
      :author    => entry.author,
      :summary   => entry.summary
    ).permit!
  end
end