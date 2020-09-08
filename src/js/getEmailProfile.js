export const userEmail = document.getElementById('user-email');
export const totalEmails = document.getElementById('total-emails');
export const signOut = document.getElementById('sign-out');
export const signIn = document.getElementById('sign-in');


export function getEmailProfile() {
    gapi.client.gmail.users.getProfile({
      'userId': 'me'
    }).then(function (response) {
      let{emailAddress, threadsTotal } = response.result
      userEmail.innerText = emailAddress;
      totalEmails.innerText = threadsTotal;
      return response.result; 
    });
  }
