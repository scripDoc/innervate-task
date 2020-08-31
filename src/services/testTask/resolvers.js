import moment from 'moment';
import crypto from 'crypto';
import { oncePerServices, missingService } from '../../common/services/index';

function apolloToRelayResolverAdapter(oldResolver) {
  return function (obj, args, context) {
    return oldResolver(args, context.request);
  }
}

export default oncePerServices(function (services) {
  const {
    postgres = missingService('postgres')
  } = services;

  function usersListQuery(builderContext) {
    return async function (obj, args, context) {
      try {
        const queryArgs = {
          statement: 'select * from users'
        };
        
        return (await postgres.exec(queryArgs)).rows
      } catch (err) {
        console.log(err.message)
      }
    }
  }

  function managersListQuery(builderContext) {
    return async function (obj, args, context) {
      try {
        const queryArgs = {
          statement: 'select * from users where manager = true'
        };
        
        return (await postgres.exec(queryArgs)).rows
      } catch (err) {
        console.log(err.message)
      }
    }
  }

  function blockedListQuery(builderContext) {
    return async function (obj, args, context) {
      try {
        const queryArgs = {
          statement: 'select * from users where blocked = true'
        };
        
        return (await postgres.exec(queryArgs)).rows
      } catch (err) {
        console.log(err.message)
      }
    }
  }

  function userByNameQuery(builderContext) {
    return async function (obj, args, context) {
      try {
        const { name, login } = args

        const queryArgs = {
          statement: `select * from users where name ilike '%'||$1||'%' or login like $2||'%' limit 1`,
          params: [name, login]
        };
        
        return (await postgres.exec(queryArgs)).rows
      } catch (err) {
        console.log(err.message)
      }
    }
  }

  function loginMutation(builderContext) {
    return async function (obj, args, context) {
      try {
        const { login, password } = args

        const queryArgs = {
          statement: `select * from users where login = $1`,
          params: [login]
        };

        const user = (await postgres.exec(queryArgs)).rows[0]

        if (!user) {
          return new Error('Incorrect login')
        }
        
        const valid =  crypto.createHash('md5').update(password).digest('hex') === user.password_hash
       
        if (!valid) {
          return new Error('Incorrect password')
        }

        return true
      } catch (err) {
        console.log(err.message)
      }
    }
  }

  return {
    usersListQuery,
    managersListQuery,
    blockedListQuery,
    userByNameQuery,
    loginMutation
  }
});
