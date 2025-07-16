import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export function useSocket(url) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketIo = io(url, {
      transports: ['websocket', 'polling']
    });

    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, [url]);

  return socket;
}
