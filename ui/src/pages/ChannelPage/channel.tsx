import React, { useState, useEffect } from 'react';
import Chat from '../../components/Chat';
import '../../css/Pages/Channel.css';
import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import ListGroup from 'react-bootstrap/ListGroup';
import { useNavigate } from 'react-router-dom';
import Header from '../HomePage/Header';
import { GetUserInfo } from '../../services/User/getUserInfo';
import { GetUserIt } from '../../models/getUser';

const popover = (elem: number) => (
  <Popover id="popover-basic">
    <Popover.Header as="h3">Player Name</Popover.Header>
    <Popover.Body>
      <Button variant="success">Game</Button>{' '}
      <Button variant="primary">DM</Button>
    </Popover.Body>
  </Popover>
);
const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

export default function Channel() {
  const navigate = useNavigate();
  const [playerClicked, setPlayerClicked] = useState<number>();
  const [username, setUsername] = useState<string | null>(null);
  const [user, setUser] = useState<GetUserIt>();

  function clickPlayer(e: React.MouseEvent, playerClickID: number) {
    e.preventDefault();
    if (playerClickID === playerClicked) setPlayerClicked(-1);
    else setPlayerClicked(playerClickID);
  }

  useEffect(() => {
    setPlayerClicked(-1);
    const usernameStorage = localStorage.getItem('nickname');
    setUsername(usernameStorage);
    if (usernameStorage === null) navigate('/');
    else
      GetUserInfo(localStorage.getItem('nickname')!).then((e) => {
        if (e.ok) e.text().then((i) => setUser(JSON.parse(i)));
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function needShowInfo(playerID: number): boolean {
    return playerID === playerClicked;
  }

  return username ? (
    <div>
      <Header username={username} iconUser={user?.avatar} />
      <div className="btnCont">
        <h1 className="txtChannel">Chat Room</h1>
        <div className="ChannelContainer">
          <Chat />
          <div
            className="playerList"
            style={
              playerClicked === -1
                ? { overflow: 'scroll' }
                : { overflow: 'hidden' }
            }
          >
            <ListGroup variant="flush">
              {array.map((elem) => (
                <ListGroup.Item
                  key={elem}
                  onClick={(e: React.MouseEvent) => clickPlayer(e, elem)}
                  style={
                    playerClicked === -1 || playerClicked === elem
                      ? { cursor: 'pointer' }
                      : { cursor: '' }
                  }
                >
                  <OverlayTrigger
                    show={needShowInfo(elem)}
                    trigger="click"
                    placement="bottom"
                    overlay={popover(elem)}
                  >
                    <span
                      style={
                        playerClicked === elem
                          ? { color: 'red' }
                          : { color: 'black' }
                      }
                      onMouseOver={(e) => e.preventDefault()}
                      className="playerListItem"
                    >
                      {'Player ' + elem}
                    </span>
                  </OverlayTrigger>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        </div>
        <Button
          onClick={() => {
            navigate('/channelManager');
          }}
          variant="success"
        >
          Manage Channels
        </Button>
      </div>
    </div>
  ) : null;
}
