export function GetDM()
{
    return fetch(process.env.REACT_APP_API_URL + '/chat/direct_messages', {
        headers: {
            'Content-Type': 'application/json',
        },
        method: 'GET',
        credentials: 'include',
        });
}