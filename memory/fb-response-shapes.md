---
name: Facebook private API response shapes
description: Actual field paths used by thread list, search, and presence modules — confirmed by reading the source
---

# Facebook private API response shapes

## Thread list
- Connection shape: `data.viewer.message_threads.edges[].node` OR `data.user.message_threads.edges[].node` OR `data.message_threads.edges[].node`
- **NOT** `message_threads.nodes` — Facebook uses edges, not nodes array
- Pagination: `.page_info.has_next_page` / `.page_info.end_cursor`

## Search (both messages AND threads)
- Both queries return `data.search_results.edges[].node`
- Message nodes have: `message_id`, `id`, `thread_key`, `sender.id`, `sender.name`, `text`, `snippet`, `timestamp`
- Thread nodes have: `thread_key`, `id`, `name`, `is_group_thread`, `all_participants[]`, `last_message.timestamp`

## Presence
- `data.user.presence_data` OR `data.presence.presence_data`
- Fields: `is_online` (not `is_active`), `is_present` (alternate), `last_active_time` (seconds), `last_active` (alternate)

## Thread setPhoto endpoint
- URL: `https://www.facebook.com/ajax/messaging/set_thread_image.php` (NOT `/messaging/set_thread_image/`)
- Field name: `thread_image` (not `file`)
