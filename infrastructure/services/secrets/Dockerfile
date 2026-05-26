# ============================================
# Bitwarden CLI - Secret Fetcher
# ============================================

FROM node:22-alpine

ENV NPM_CONFIG_LOGLEVEL=error
ENV NPM_CONFIG_FUND=false
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

RUN npm install -g @bitwarden/cli 2>/dev/null \
    && apk add --no-cache bash curl jq

WORKDIR /work

VOLUME ["/root/.config/Bitwarden CLI"]

ENTRYPOINT ["bw"]
CMD ["--help"]