#!/bin/sh

case "$1" in
  *Username*)
    printf '%s\n' "$PAGES_USER"
    ;;
  *Password*)
    printf '%s\n' "$PAGES_TOKEN"
    ;;
  *)
    printf '\n'
    ;;
esac
