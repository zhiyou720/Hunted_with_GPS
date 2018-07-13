import socket, threading


class OneClient(threading.Thread):
    def __init__(self, conn, addr):
        threading.Thread.__init__(self)

        self._conn = conn
        self._addr = addr

    def send(self, data):
        try:
            self._conn.sendall(data)
        except socket.error as msg:
            self.close()

    def close(self):
        self._conn.close()
        print('Disconnected by', self._addr)

    def run(self):
        while True:
            data = self._conn.recv(1024)
            if not data:
                self.close()
                break

            if data.startswith(b'byebye'):
                self.close()
                break

            self.send(data)
            print(str(data, encoding="utf-8"))


s = socket.socket()


