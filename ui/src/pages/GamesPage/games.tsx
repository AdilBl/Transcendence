import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';
import { GetUserIt } from '../../models/getUser';
import { GetUserInfo } from '../../services/User/getUserInfo';
import { UserLogout } from '../../services/User/userDelog';
import '../../css/Pages/ListeParty.css';
import { socket } from '../../services/socket';
import TSSnackbar from '../../components/TSSnackbar';
import useSnackbar from '../../customHooks/useSnackbar';
import useReceiveInvite from '../../customHooks/receiveInvite';

type gameProp = {
  gameid: string;
  player1: string;
  player2: string;
};

export default function Games() {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);
  const [user, setUser] = useState<GetUserIt>();
  const [gamesList, setGamesList] = useState<gameProp[]>();
  const snackbar = useSnackbar();
  const sender = useReceiveInvite(snackbar, navigate);
  useEffect(() => {
    setGamesList([]);
    const usernameStorage = localStorage.getItem('nickname');
    setUsername(usernameStorage);
    if (usernameStorage === null) navigate('/');
    else
      GetUserInfo(localStorage.getItem('nickname')!).then(async (e) => {
        if (e.status === 401) {
          await UserLogout();
          navigate('/');
        } else if (e.ok) e.text().then((i) => setUser(JSON.parse(i)));
      });
    socket.emit('Getallgame');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    socket.on('Getallgame', (games: gameProp[]) => {
      setGamesList(games);
    });
  }, [socket]); // eslint-disable-line react-hooks/exhaustive-deps

  return username ? (
    <>
      <Header username={username} iconUser={user?.avatar} />
      <div className="ListeParty_block">
        {localStorage.getItem('searcheGame') ? (
          <button
            style={{ display: 'block', margin: '150px auto' }}
            className="btn btn-warning"
            onClick={() => {
              socket.emit('LeaveQueue', username);
              snackbar.setMessage('Game queue left');
              snackbar.setSeverity('error');
              snackbar.setOpen(true);
              localStorage.removeItem('searcheGame');
            }}
          >
            Quit Queue
          </button>
        ) : (
          <button
            style={{ display: 'block', margin: '150px auto' }}
            className="btn btn-success"
            onClick={() => {
              socket.emit('Addtoqueue', username);
              snackbar.setMessage('Added to Game queue');
              snackbar.setSeverity('success');
              snackbar.setOpen(true);
              localStorage.setItem('searcheGame', 'true');
            }}
          >
            Play New Game
          </button>
        )}
        <h2 className="ListeParty_title">Current Games: </h2>
        <div className="ListeParty_list">
          {gamesList && gamesList.length >= 1
            ? gamesList?.map((e: gameProp, i: number) => (
                <div className="card" style={{ width: '18rem' }}>
                  <div className="card-body">
                    <h5 className="card-title">Game</h5>
                    <p className="card-text">
                      {' '}
                      {e.player1}x{e.player2}{' '}
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate(`game_${e.gameid}`)}
                    >
                      Spetatate
                    </button>
                  </div>
                </div>
              ))
            : null}
        </div>
      </div>
      <TSSnackbar
        open={snackbar.open}
        setOpen={snackbar.setOpen}
        severity={snackbar.severity}
        message={snackbar.message}
        senderInvite={sender}
        username={username}
      />
    </>
  ) : null;
}
