---
name: Attachment upload — require real server ID
description: uploadAttachment() must throw UploadError if Facebook returns no attachment ID
---

# Attachment upload — server ID requirement

## Rule
`MessagesModule.uploadAttachment()` must throw `UploadError` if the Facebook upload response does not contain a real server-assigned ID (fbid / attachment_id / attachment_token). Never fall back to the client-generated `uploadId`.

**Why:** A client-generated fallback ID produces invalid `image_ids[]` / `video_ids[]` / `file_ids[]` params in the subsequent send call. Facebook silently drops the attachment, leaving the user with no error but a broken message.

**How to apply:** After parsing the upload response, check `rawId`. If falsy, throw `UploadError` with the full (truncated) response body for diagnosis. See `src/messages/index.ts`.
