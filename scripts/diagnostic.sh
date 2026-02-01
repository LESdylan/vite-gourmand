#!/bin/bash

shopt -s nocasematch

POSTGRES_CONTAINER="vite-gourmand-db-1"

function check_load_db() {
	echo "Checking PostgreSQL container status..."
	status=$(docker inspect -f '{{.State.Status}}' "$POSTGRES_CONTAINER" 2>/dev/null)
	if [[ "$status" == "running" ]]; then
		health=$(docker inspect -f '{{.State.Health.Status}}' "$POSTGRES_CONTAINER" 2>/dev/null)
		if [[ "$health" == "healthy" ]]; then
			echo "load_db: OK (PostgreSQL container is running and healthy)"
			echo "--- Databases: ---"
			docker exec -e PGPASSWORD=postgres "$POSTGRES_CONTAINER" psql -U postgres -tAc "SELECT datname FROM pg_database WHERE datistemplate = false;"
			echo "--- Tables in vite_gourmand: ---"
			docker exec -e PGPASSWORD=postgres "$POSTGRES_CONTAINER" psql -U postgres -d vite_gourmand -c "\dt"
		else
			echo "load_db: WARNING (PostgreSQL container is running but not healthy: $health)"
		fi
	else
		echo "load_db: ERROR (PostgreSQL container is not running)"
	fi
}

while true; do
	read -rp "diag> " cmd
	case "$cmd" in
		load_db)
			check_load_db
			;;
		exit|quit)
			echo "Exiting diagnostic REPL."
			break
			;;
		*)
			echo "Unknown command: $cmd"
			;;
	esac
done
