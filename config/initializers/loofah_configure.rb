# XXX: Hack!
# XXX: Monkey patch Loofah's whitelist tags
# XXX: This allows configurable tag whitelist
# XXX: where user can specify which tags to keep.
#
# see https://github.com/flavorjones/loofah/blob/master/lib/loofah/html5/whitelist.rb
# for current default whitelist.
begin
  tag_list = Loofah::HTML5::WhiteList::ALLOWED_ELEMENTS_WITH_LIBXML2
  tag_list += ENV["WLTAGS"].split if ENV["WLTAGS"]
  Loofah::HTML5::WhiteList::send :remove_const, :ALLOWED_ELEMENTS_WITH_LIBXML2
  Loofah::HTML5::WhiteList::const_set :ALLOWED_ELEMENTS_WITH_LIBXML2, tag_list
rescue => ex
  logger.warn "Monkey-patching Loofah failed: #{ex.message}"
end
