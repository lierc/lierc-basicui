FROM node

WORKDIR /opt/lierc-basicui
RUN apt-get update && apt-get install -y cpanminus

RUN npm install -g handlebars
RUN cpanm -nq AnyEvent::Filesys::Notify Term::ANSIColor

RUN git clone https://github.com/google/brotli.git
RUN cd brotli && ./configure && make
RUN cp brotli/bin/brotli /usr/local/bin/
RUN rm -rf brotli

CMD make watch
