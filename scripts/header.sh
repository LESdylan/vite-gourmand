#!/usr/bin/env bash
# **************************************************************************** #
#                                                                              #
#    header.sh - Clean header generator with customizable logo                #
#                                                                              #
# **************************************************************************** #

HEADER_WIDTH=80
COMMENT_START="/*"
COMMENT_END="*/"

# =============================================================================
# GIT METADATA
# =============================================================================

get_git_user_name() {
    local name
    name=$(git config --get user.name 2>/dev/null)
    [[ -z "$name" ]] && name="${USER:-anonymous}"
    echo "$name"
}

get_git_user_email() {
    git config --get user.email 2>/dev/null || echo ""
}

# =============================================================================
# COMMENT STYLES
# =============================================================================

declare -A COMMENT_STYLES=(
    ["c"]="/* */" ["h"]="/* */" ["cpp"]="/* */" ["hpp"]="/* */"
    ["java"]="/* */" ["js"]="/* */" ["ts"]="/* */" ["css"]="/* */"
    ["go"]="/* */" ["rs"]="/* */" ["swift"]="/* */" ["php"]="/* */"
    ["sh"]="# #" ["bash"]="# #" ["py"]="# #" ["rb"]="# #"
    ["yaml"]="# #" ["yml"]="# #" ["makefile"]="# #"
    ["html"]="<!-- -->" ["xml"]="<!-- -->" ["vue"]="<!-- -->"
    ["sql"]="-- --" ["lua"]="-- --"
)

set_comment_style() {
    local ext="${1##*.}"
    ext="${ext,,}"
    local style="${COMMENT_STYLES[$ext]:-# #}"
    COMMENT_START="${style%% *}"
    COMMENT_END="${style##* }"
}

set_comment_style_manual() {
    case "$1" in
        c|cpp|java|js|ts|css) COMMENT_START="/*"; COMMENT_END="*/" ;;
        shell|sh|py|rb) COMMENT_START="#"; COMMENT_END="#" ;;
        html|xml) COMMENT_START="<!--"; COMMENT_END="-->" ;;
        sql|lua) COMMENT_START="--"; COMMENT_END="--" ;;
        *) COMMENT_START="#"; COMMENT_END="#" ;;
    esac
}

# =============================================================================
# LOGOS / BANNERS - Clean ASCII art (centered above metadata)
# =============================================================================

# STUDI logo - graduation cap / book
logo_studi() {
    cat << 'EOF'
        _______________
       /              /|
      /______________/ |
      |   ___  ___  |  |
      |  |   ||   | |  |
      |  | S || T | | /
      |  |___||___| |/
      |_____________|
         STUDI
EOF
}

# Simple book logo
logo_book() {
    cat << 'EOF'
       ________
      /       /|
     /  STUDI/ |
    /_____ _/  |
    |      |  /
    |______|_/
EOF
}

# Minimal S logo
logo_s() {
    cat << 'EOF'
    ╔═══════╗
    ║ STUDI ║
    ╚═══════╝
EOF
}

# Code/Terminal style
logo_code() {
    cat << 'EOF'
    ┌──────────────┐
    │ > STUDI_     │
    │   Learning   │
    └──────────────┘
EOF
}

# =============================================================================
# 3D CUBE WITH INITIALS (right side branding)
# =============================================================================

# DL cube lines - 3D isometric cube using box-drawing
# Returns lines without trailing spaces - alignment handled by line_left_right
get_cube_lines() {
    local i="${1:-DL}"
    # True 3D isometric cube
    printf '%s\n' "  .------."
    printf '%s\n' " /  $i  /|"
    printf '%s\n' "+------+ |"
    printf '%s\n' "|  $i  |/"
    printf '%s\n' "+------+"
}

# Get max width of cube for padding (widest line)
get_cube_width() {
    echo 10
}

# =============================================================================
# UTILITIES
# =============================================================================

get_visible_length() {
    echo -n "$1" | wc -m | tr -d ' '
}

repeat_char() {
    printf '%*s' "$2" '' | tr ' ' "$1"
}

get_inner_width() {
    echo $((HEADER_WIDTH - ${#COMMENT_START} - ${#COMMENT_END} - 2))
}

# =============================================================================
# LINE BUILDERS
# =============================================================================

line_border() {
    local iw=$(get_inner_width)
    printf "%s %s %s\n" "$COMMENT_START" "$(repeat_char '*' "$iw")" "$COMMENT_END"
}

line_empty() {
    local iw=$(get_inner_width)
    printf "%s%*s%s\n" "$COMMENT_START" "$((iw + 2))" "" "$COMMENT_END"
}

line_centered() {
    local content="$1"
    local iw=$(get_inner_width)
    local clen=$(get_visible_length "$content")
    local lpad=$(( (iw - clen) / 2 ))
    [[ $lpad -lt 0 ]] && lpad=0
    local rpad=$((iw - clen - lpad))
    [[ $rpad -lt 0 ]] && rpad=0
    printf "%s %*s%s%*s %s\n" "$COMMENT_START" "$lpad" "" "$content" "$rpad" "" "$COMMENT_END"
}

line_left() {
    local content="$1"
    local iw=$(get_inner_width)
    local clen=$(get_visible_length "$content")
    local rpad=$((iw - clen))
    [[ $rpad -lt 0 ]] && rpad=0
    printf "%s %s%*s %s\n" "$COMMENT_START" "$content" "$rpad" "" "$COMMENT_END"
}

# Build a line with left content and right content (for metadata + cube)
# Right content is right-padded to fixed width, then positioned at right edge
line_left_right() {
    local left_content="$1"
    local right_content="$2"
    local right_width="${3:-10}"  # Fixed width for right column
    local iw=$(get_inner_width)
    local left_len=${#left_content}
    local right_len=${#right_content}
    
    # Right-pad the right content to fixed width
    local right_pad=$((right_width - right_len))
    [[ $right_pad -lt 0 ]] && right_pad=0
    local right_padded="$right_content$(printf '%*s' "$right_pad" '')"
    
    # Calculate gap between left and right
    local gap=$((iw - left_len - right_width))
    [[ $gap -lt 1 ]] && gap=1
    
    printf "%s %s%*s%s %s\n" "$COMMENT_START" "$left_content" "$gap" "" "$right_padded" "$COMMENT_END"
}

# =============================================================================
# HEADER GENERATOR
# =============================================================================

generate_header() {
    local name="${1:-unknown}"
    local author="${2:-$(get_git_user_name)}"
    local email="${3:-$(get_git_user_email)}"
    local logo_func="$4"
    local updated_by="${5:-$author}"
    local initials="${6:-DL}"
    
    local date_short=$(date "+%Y/%m/%d %H:%M")
    
    # Get cube lines into array
    local -a cube_lines
    mapfile -t cube_lines < <(get_cube_lines "$initials")
    local cube_count=${#cube_lines[@]}
    
    # Build metadata lines (pad to match cube height)
    local -a meta_lines
    meta_lines[0]="File:     $name"
    [[ -n "$email" ]] && meta_lines[1]="By:       $author <$email>" || meta_lines[1]="By:       $author"
    meta_lines[2]="Created:  $date_short by $author"
    meta_lines[3]="Updated:  $date_short by $updated_by"
    # Pad with empty lines if cube has more lines
    for ((i=4; i<cube_count; i++)); do
        meta_lines[$i]=""
    done
    
    # Top border
    line_border
    line_empty
    
    # Banner/Logo section (only if provided)
    if [[ -n "$logo_func" ]] && type "$logo_func" &>/dev/null; then
        while IFS= read -r bline; do
            line_centered "$bline"
        done <<< "$("$logo_func")"
        line_empty
    fi
    
    # Metadata section with cube on the right
    local cw=$(get_cube_width)
    for ((i=0; i<cube_count; i++)); do
        line_left_right "   ${meta_lines[$i]}" "${cube_lines[$i]}" "$cw"
    done
    
    line_empty
    # Bottom border
    line_border
}

# =============================================================================
# FILE OPERATIONS
# =============================================================================

has_header() {
    head -n 3 "$1" 2>/dev/null | grep -qE "^(/\*|#|<!--|--)[[:space:]]\*+[[:space:]](\*/|#|-->|--)"
}

count_header_lines() {
    local count=0 in_header=false border_count=0
    while IFS= read -r line; do
        if echo "$line" | grep -qE "^(/\*|#|<!--|--)[[:space:]]\*+[[:space:]](\*/|#|-->|--)"; then
            ((border_count++))
            ((count++))
            [[ $border_count -eq 1 ]] && in_header=true
            [[ $border_count -eq 2 ]] && break
        elif $in_header; then
            ((count++))
        else
            break
        fi
    done < "$1"
    echo "$count"
}

insert_header() {
    local file="$1" name="${2:-$(basename "$1")}"
    local author="${3:-$(get_git_user_name)}" email="${4:-$(get_git_user_email)}"
    local logo="${5:-logo_studi}" updated="${6:-}"
    
    [[ ! -f "$file" ]] && { echo "Error: File not found: $file" >&2; return 1; }
    set_comment_style "$file"
    has_header "$file" && { echo "Warning: Header exists. Use -u to update." >&2; return 1; }
    
    local header=$(generate_header "$name" "$author" "$email" "$logo" "$updated")
    local tmp=$(mktemp)
    local first=$(head -n 1 "$file")
    
    if [[ "$first" =~ ^#! ]]; then
        echo "$first" > "$tmp"
        echo "$header" >> "$tmp"
        tail -n +2 "$file" >> "$tmp"
    else
        echo "$header" > "$tmp"
        cat "$file" >> "$tmp"
    fi
    
    mv "$tmp" "$file"
    echo "Header inserted: $file"
}

update_header() {
    local file="$1" name="${2:-$(basename "$1")}"
    local author="${3:-$(get_git_user_name)}" email="${4:-$(get_git_user_email)}"
    local logo="${5:-logo_studi}" updated="${6:-$(get_git_user_name)}"
    
    [[ ! -f "$file" ]] && { echo "Error: File not found: $file" >&2; return 1; }
    set_comment_style "$file"
    
    if ! has_header "$file"; then
        insert_header "$file" "$name" "$author" "$email" "$logo" "$updated"
        return
    fi
    
    local hcount=$(count_header_lines "$file")
    local header=$(generate_header "$name" "$author" "$email" "$logo" "$updated")
    local tmp=$(mktemp)
    local first=$(head -n 1 "$file")
    
    if [[ "$first" =~ ^#! ]]; then
        echo "$first" > "$tmp"
        echo "$header" >> "$tmp"
        tail -n +$((hcount + 2)) "$file" >> "$tmp"
    else
        echo "$header" > "$tmp"
        tail -n +$((hcount + 1)) "$file" >> "$tmp"
    fi
    
    mv "$tmp" "$file"
    echo "Header updated: $file"
}

# =============================================================================
# CLI
# =============================================================================

print_usage() {
    cat << 'EOF'
Usage: header.sh [OPTIONS] [FILE]

Clean header generator with customizable ASCII logo.

OPTIONS:
    -h, --help          Show help
    -p, --preview       Preview header
    -i, --insert        Insert header into file
    -u, --update        Update existing header
    -a, --author NAME   Author name (default: git user.name)
    -e, --email EMAIL   Email (default: git user.email)
    -c, --changes NAME  "Updated by" name
    -n, --name NAME     File name (default: filename)
    -l, --logo FUNC     Logo function: logo_studi, logo_book, logo_s, logo_code, none
    -s, --style STYLE   Comment style: c, shell, html, sql

EXAMPLES:
    header.sh -p -s c -n "main.c"              # Preview with STUDI logo
    header.sh -p -l none -s c -n "test.c"      # Preview without logo
    header.sh -p -l logo_code -s c -n "app.c"  # Preview with code logo
    header.sh -i myfile.c                       # Insert into file
EOF
}

main() {
    local action="preview" author="" email="" updated="" name="" logo="logo_studi" file="" style=""
    
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -h|--help) print_usage; exit 0 ;;
            -p|--preview) action="preview"; shift ;;
            -i|--insert) action="insert"; shift ;;
            -u|--update) action="update"; shift ;;
            -a|--author) author="$2"; shift 2 ;;
            -e|--email) email="$2"; shift 2 ;;
            -c|--changes) updated="$2"; shift 2 ;;
            -n|--name) name="$2"; shift 2 ;;
            -l|--logo) [[ "$2" == "none" ]] && logo="" || logo="$2"; shift 2 ;;
            -b|--banner) [[ "$2" == "none" ]] && logo="" || logo="$2"; shift 2 ;;  # Alias
            -s|--style) style="$2"; shift 2 ;;
            -*) echo "Unknown: $1" >&2; exit 1 ;;
            *) file="$1"; shift ;;
        esac
    done
    
    [[ -z "$author" ]] && author=$(get_git_user_name)
    [[ -z "$email" ]] && email=$(get_git_user_email)
    [[ -z "$name" ]] && name="${file:+$(basename "$file")}"
    [[ -z "$name" ]] && name="untitled"
    [[ -n "$style" ]] && set_comment_style_manual "$style"
    [[ -n "$file" && -z "$style" ]] && set_comment_style "$file"
    
    case "$action" in
        preview) generate_header "$name" "$author" "$email" "$logo" "$updated" ;;
        insert) [[ -z "$file" ]] && { echo "No file specified" >&2; exit 1; }; insert_header "$file" "$name" "$author" "$email" "$logo" "$updated" ;;
        update) [[ -z "$file" ]] && { echo "No file specified" >&2; exit 1; }; update_header "$file" "$name" "$author" "$email" "$logo" "$updated" ;;
    esac
}

[[ "${BASH_SOURCE[0]}" == "${0}" ]] && main "$@"
