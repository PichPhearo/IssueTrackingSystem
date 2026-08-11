FROM php:8.2-cli

# Install system dependencies and PostgreSQL / PDO extension
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libpq-dev

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath gd

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy project files
COPY . /app

# Install composer dependencies
RUN composer install --no-dev --optimize-autoloader

# Expose default port
EXPOSE 8080

# Run migrations and serve on $PORT provided by Render
CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-8080}
