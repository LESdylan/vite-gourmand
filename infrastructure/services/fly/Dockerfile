FROM alpine:3.20

ARG FLYCTL_VERSION=0.4.55

RUN apk add --no-cache \
    bash \
    bind-tools \
    ca-certificates \
    coreutils \
    curl \
    git \
    gzip \
    jq \
    nodejs \
    npm \
    openssl \
    tar \
    && update-ca-certificates \
    && curl -fsSL "https://github.com/superfly/flyctl/releases/download/v${FLYCTL_VERSION}/flyctl_${FLYCTL_VERSION}_Linux_x86_64.tar.gz" -o /tmp/flyctl.tar.gz \
    && curl -fsSL "https://github.com/superfly/flyctl/releases/download/v${FLYCTL_VERSION}/flyctl_${FLYCTL_VERSION}_checksums.txt" -o /tmp/flyctl_checksums.txt \
    && grep "flyctl_${FLYCTL_VERSION}_Linux_x86_64.tar.gz" /tmp/flyctl_checksums.txt | sha256sum -c - \
    && tar -xzf /tmp/flyctl.tar.gz -C /usr/local/bin flyctl \
    && chmod +x /usr/local/bin/flyctl \
    && ln -sf /usr/local/bin/flyctl /usr/local/bin/fly \
    && rm -f /tmp/flyctl.tar.gz /tmp/flyctl_checksums.txt

COPY infrastructure/services/fly/scripts/entrypoint.sh /usr/local/bin/fly-entrypoint
RUN chmod +x /usr/local/bin/fly-entrypoint

WORKDIR /workspace

ENTRYPOINT ["fly-entrypoint"]
CMD ["bash"]