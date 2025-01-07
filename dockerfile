FROM ubuntu:noble
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update
RUN apt-get upgrade -y
RUN apt install libffi-dev -y

RUN apt-get install -y make 
RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install -y cmake 
RUN apt-get install -y g++
RUN apt-get install -y libboost-all-dev
RUN apt-get install -y autoconf
RUN apt-get install -y bison 
RUN apt-get install -y flex
RUN apt-get install -y libgrpc++1
RUN apt-get install -y libeigen3-dev
RUN apt-get install -y pkgconf
RUN apt-get install -y libgrpc++-dev 
RUN apt-get install -y  libprotobuf-dev
RUN apt-get install -y  protobuf-compiler
RUN apt-get install -y  protobuf-compiler-grpc


RUN python3 --version
RUN apt-get install -y python3-pip
RUN python3 -m pip install numpy --break-system-packages
RUN python3 -m pip install  scipy --break-system-packages
RUN python3 -m pip install mip --break-system-packages

# automaton generator for LTLf
COPY ltlfkit/ /usr/src/ltlfkit
WORKDIR /usr/src/ltlfkit/LTLf2FOL/ltlf2fol
RUN make 
RUN make run
WORKDIR /usr/src/ltlfkit/ext/MONA
RUN autoreconf -f -i
RUN ./configure --prefix=`pwd`
RUN make
RUN bash -c 'echo -e ++++++++++++++++++++++++++ `pwd`'
RUN make install-strip

#spot
RUN apt-get install -y wget gnupg
RUN wget -q -O - https://www.lrde.epita.fr/repo/debian.gpg | apt-key add -
RUN echo 'deb http://www.lrde.epita.fr/repo/debian/ stable/' >> /etc/apt/sources.list
RUN apt-get update
RUN apt-get install -y spot libspot-dev

# FD
RUN mkdir -p /usr/src/FD
COPY downward-xaip/ /usr/src/FD/
WORKDIR /usr/src/FD
RUN rm -r builds
RUN ./build.py


RUN mkdir -p /usr/src/app/src
RUN mkdir -p /usr/temp

#install Node.js
WORKDIR /usr/src/app
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_22.x | bash -
RUN apt-get install -y nodejs

#copy app bin
COPY src/ /usr/src/app/src
COPY package-lock.json/ /usr/src/app
COPY package.json/ /usr/src/app
COPY tsconfig.json/ /usr/src/app
WORKDIR /usr/src/app
RUN npm install
RUN npm install -g ts-node

# run
EXPOSE 3333

ENV PLANNER_SERVICE_PLANNER="/usr/src/FD/fast-downward.py"
ENV TEMP_RUN_FOLDERS="/usr/temp"

WORKDIR /usr/src/app/
CMD npm start
