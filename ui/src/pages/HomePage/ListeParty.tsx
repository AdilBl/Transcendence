import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import AvailableParty from '../../components/AvailableParty';
import '../../css/Pages/ListeParty.css';
import { Channel } from '../../models/channel';
import { GetChannels } from '../../services/Channel/getChannels';
import { UserLogout } from '../../services/User/userDelog';

export default function ListeParty({
  socket,
  username,
}: {
  socket: Socket | undefined;
  username: string;
}) {
  let [games, setGames] = useState<Channel[]>([]);

  socket?.on('createChannel', function () {
    getListParty().then((e) => setGames(e));
  });

  const joinChannel = (e: Channel) => {
    socket?.emit('joinChannel', {
      channelName: e.name,
      userNickname: username,
      isAdmin: false,
      password: e.password,
    });
  };

  const leaveChannel = (e: Channel) => {
    socket?.emit('leaveChannel', {
      channelName: e.name,
      userNickname: username,
      isAdmin: false,
      password: e.password,
    });
  };

  useEffect(() => {
    getListParty().then((e) => setGames(e));
  }, []);

  async function getListParty() {
    const requete = await GetChannels();
    if (requete.status === 401) {
      await UserLogout();
      navigate('/');
    }
    const txt = await requete.text();
    return JSON.parse(txt);
  }

  useEffect(() => {
    getListParty().then((e) => setGames(e));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="ListeParty_block">
      <h2 className="ListeParty_title">Available Channels: </h2>
      <div className="ListeParty_list">
        {games.map((e: Channel, i: number) => {
          return e.restriction !== 'private' ? (
            <AvailableParty
              key={i}
              name={e.name}
              password={e.restriction === 'public'}
              id={e.id.toString()}
              joinChannel={() => joinChannel(e)}
              leaveChannel={() => leaveChannel(e)}
            />
          ) : null;
        })}
      </div>
    </div>
  );
}
