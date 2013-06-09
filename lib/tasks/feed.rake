namespace :newsitem do
  desc "Destroy all newsitem marked as read"
  task :clear => :environment do
    Newsitem
      .where("created_at < ?", 3.days.ago)
      .where(unread: 0)
      .destroy_all
  end

  desc "Mark all news as read"
  task :mark_as_read => :environment do
    Newsitem.all.each do |item|
      item.set_read
      item.save!
    end
  end
end
