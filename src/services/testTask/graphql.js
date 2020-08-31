import {oncePerServices, missingService} from '../../common/services/index'

const PREFIX = '';

export default oncePerServices(function (services) {
  
  const graphqlBuilderSchema = require('../../common/graphql/LevelBuilder.schema');
  
  const resolvers = require('./resolvers').default(services);
  
  return async function builder(args) {
    
    graphqlBuilderSchema.build_options(args);
    const { parentLevelBuilder, typeDefs, builderContext } = args;
    
    typeDefs.push(`
      type ${PREFIX}UserDataObject {
        birthday: String
      }
    
      type ${PREFIX}User {
        user_id: ID,
        login: String,
        name: String,
        email: String,
        manager: Boolean,
        blocked: Boolean,
        data: ${PREFIX}UserDataObject
      }
      
    `);

    parentLevelBuilder.addQuery({
      name: `usersList`,
      description: 'Get users list',
      type: `[${PREFIX}User]`,
      resolver: resolvers.usersListQuery(builderContext),
    });

    parentLevelBuilder.addQuery({
      name: `managersList`,
      description: 'Get managers list',
      type: `[${PREFIX}User]`,
      resolver: resolvers.managersListQuery(builderContext),
    });

    parentLevelBuilder.addQuery({
      name: `blockedList`,
      description: 'Get blocked users list',
      type: `[${PREFIX}User]`,
      resolver: resolvers.blockedListQuery(builderContext),
    });

    parentLevelBuilder.addQuery({
      name: `user`,
      description: 'Find user by name or login',
      type: `[${PREFIX}User]`,
      args: `
        name: String,
        login: String
      `,
      resolver: resolvers.userByNameQuery(builderContext),
    });

    parentLevelBuilder.addMutation({
      name: `login`,
      description: 'User authorization',
      type: `Boolean`,
      args: `
        login: String!,
        password: String!
      `,
      resolver: resolvers.loginMutation(builderContext),
    });
  }
});
