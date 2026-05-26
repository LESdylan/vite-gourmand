FROM alpine:3.20

RUN apk add --no-cache \
    bash \
    bind-tools \
    ca-certificates \
    coreutils \
    curl \
    git \
    jq \
    nodejs \
    npm \
    openssl \
    tar \
    gzip \
    && update-ca-certificates \
    && curl -L https://fly.io/install.sh | sh \
    && ln -sf /root/.fly/bin/flyctl /usr/local/bin/flyctl \
    && ln -sf /root/.fly/bin/fly /usr/local/bin/fly

COPY infrastructure/services/fly/scripts/entrypoint.sh /usr/local/bin/fly-entrypoint
RUN chmod +x /usr/local/bin/fly-entrypoint

WORKDIR /workspace

ENTRYPOINT ["fly-entrypoint"]
CMD ["bash"]