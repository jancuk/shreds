require 'authentication'
class ApplicationController < ActionController::Base
  include Shreds::Auth
  protect_from_forgery

  rescue_from ActiveRecord::RecordNotFound, :with => :feed_not_found

  before_action :init_props

  private

  def init_props
    return redirect_to('/login') unless authenticated?
    @categories = current_user.categories.for_nav
    @subscription = current_user.subscriptions.build
    @category = @subscription.category = Category.new
    @new_feed = @subscription.feed = Feed.new
  end

  def feed_not_found(exceptions)
    respond_to do |fmt|
      fmt.html do
        flash[:danger] = I18n.t('feed.not_found')
        redirect_to '/'
      end
      fmt.json { render :json => {error: I18n.t('feed.not_found')} }
    end
  end

  def may_respond_with(opts)
    respond_to do |fmt|
      fmt.html do
        flash[:info] = opts[:html][:info]
        redirect_to opts[:html][:redirect_to]
      end
      fmt.json { render :json => opts[:json] }
    end
  end

end
