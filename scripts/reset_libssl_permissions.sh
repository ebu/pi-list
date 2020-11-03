# Some version of libssl downloaded with Conan have the permissions wrong

chmod 755 $(find . -name "*libssl.so*")
chmod 755 $(find . -name "*libcrypto.so*")