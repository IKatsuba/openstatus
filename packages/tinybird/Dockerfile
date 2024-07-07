FROM tinybirdco/tinybird-cli-docker:latest

RUN pip install tinybird-cli==5.2.0

WORKDIR /app

COPY packages/tinybird .

CMD tb push _migration/ping_response.datasource &&\
    tb push datasources/__ttl_45d_count_utc_mv.datasource &&\
    tb push pipes/response_list.pipe &&\
    tb push pipes/status_timezone.pipe &&\
    tb push pipes/__ttl_45d_count_utc_get.pipe &&\
    tb push pipes/home_stats.pipe

