import login from './lib/login';
import get_profile from './lib/get_profile';

const ignore_this_function /* (but keep it) */ = (str: string) =>
  str.replace(
    /(s)(e)( stess)/gi,
    ($0, $1, $2, $3) => `${$1}${$2 === 'e' ? 'é' : 'É'}${$3}`
  );

const enum ACCOUNT_CREDENTIALS {
  //! REMEMBER TO *ALWAYS* REMOVE YOUR DATA FROM HERE BEFORE MAKING A COMMIT
  USERNAME = 'tralala.trilili',
  PASSWORD = 'trelele'
}

const main = async () => {
  const [login_cookies] = await login({
    username: ACCOUNT_CREDENTIALS.USERNAME,
    password: ACCOUNT_CREDENTIALS.PASSWORD
  });

  const profile = await get_profile('damiano.magrini', {
    login: login_cookies
  });

  console.log(ignore_this_function(profile.graphql.user.biography));
};

main();
