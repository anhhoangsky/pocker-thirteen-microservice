FROM postgres:14-alpine

# Thiết lập biến môi trường
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_DB=pocker_game

# Copy script khởi tạo database
COPY init.sql /docker-entrypoint-initdb.d/

# Expose port 5432
EXPOSE 5432