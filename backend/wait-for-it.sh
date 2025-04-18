#!/bin/sh

host_port="$1"
shift
cmd="$@"

host=$(echo "$host_port" | cut -d: -f1)
port=$(echo "$host_port" | cut -d: -f2)

while ! nc -z "$host" "$port"; do
  echo "⏳ Waiting for $host:$port..."
  sleep 1
done

echo "✅ $host:$port is up — starting app"
eval "$cmd"
