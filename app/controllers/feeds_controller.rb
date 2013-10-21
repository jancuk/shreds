class FeedsController < ApplicationController
  respond_to :html, :json

  # GET /feeds
  # GET /feeds.json
  def index
    @feed = Feed.new
    @feeds = @feeds.select {|f| f.unread_count > 0 }
    @feeds = Kaminari.paginate_array(@feeds).page(params[:page]).per(5)
    respond_with(@feeds)
  end

  # GET /feeds/1
  # GET /feeds/1.json
  def show
    @feed = Feed.find(params[:id])
    @newsitems = @feed.newsitems.page(params[:page])
    respond_with(@feed)
  end

  # POST /feeds
  # POST /feeds.json
  def create
    jid = FeedWorker.perform_async(:create, params[:feed][:url], \
      params[:category][:name].presence || Category.default)
    respond_to do |fmt|
      fmt.html {
        flash[:info] = 'Hold on, now printing your newsfeed.'
        redirect_to '/'
      }
      fmt.json { render :json => { watch: "create-#{jid}" } }
    end
  end

  def create_from_opml
    jid = OPMLWorker.save_file(params[:OPMLfile])
    render :json => { watch: "opml-#{jid}" }
  rescue OPMLWorkerError => ex
    render :json => { error: ex.message.html_safe }
  end

  # DELETE /feeds/1
  # DELETE /feeds/1.json
  def destroy
    jid = FeedWorker.perform_async(:destroy, params[:id])
    render :json => { watch: "destroy-#{jid}" }
  end

  def mark_as_read
    jid = FeedWorker.perform_async(:mark_as_read, params[:id])
    render :json => { watch: "markAsRead-#{jid}" }
  end

  def mark_all_as_read
    jid = FeedWorker.perform_async(:mark_all_as_read)
    render :json => { watch: "markAllAsRead-#{jid}" }
  end

end
