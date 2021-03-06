class EventsController < ApplicationController
  before_action :fetch_subscriptions
  skip_before_action :init_empty_subscription

  def watch
    @ev = EventsWatch.new(params[:watchList])
    @ev.execute
    @payload = @ev.payload
    if @payload.empty?
      render text: ''
    else
      render 'watch'
    end
  end
end
