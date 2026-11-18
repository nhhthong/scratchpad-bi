# Dev image: PHP CLI + Node + pnpm. Source is bind-mounted, not copied.
FROM php:8.4-cli-bookworm

ARG UID=1000
ARG GID=1000
ARG NODE_VERSION=24.16.0
ARG PNPM_VERSION=11.9.0

RUN apt-get update && apt-get install -y --no-install-recommends \
        git unzip curl xz-utils ca-certificates \
        libzip-dev libicu-dev libpng-dev libjpeg-dev libfreetype6-dev libonig-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" pdo_mysql pcntl bcmath intl zip gd exif \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && rm -rf /var/lib/apt/lists/* /tmp/pear

RUN curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz" \
        | tar -xJ -C /usr/local --strip-components=1 \
    && npm install -g "pnpm@${PNPM_VERSION}"

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

RUN (getent group ${GID} || groupadd -g ${GID} app) \
    && useradd -m -u ${UID} -g ${GID} -s /bin/bash app \
    && mkdir -p /var/www/html /home/app/.pnpm-store /home/app/.cache \
    && chown -R ${UID}:${GID} /var/www/html /home/app

WORKDIR /var/www/html
USER app
