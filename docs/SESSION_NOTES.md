# Session Notes

## Current Session

- Fixed export scale issue: exported images were appearing smaller on a larger canvas because html-to-image was capturing the scaled-down preview instead of full-size canvas. Fix temporarily sets `scale(1)` during capture.
