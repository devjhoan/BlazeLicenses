const licenseModel = require("../models/licenseModel");
const usersModel = require("../models/usersModel");

module.exports = async (guild, client) => {
    const CommandsArray = client.permissions;

    const getAllCustomers = async () => {
        const users = await licenseModel.find();
        if(users?.length == 0) return [client.user.id];
        return users.map(x => x.discord_id);
    }

    const getAllUsers = async () => {
        const user = await usersModel.find();
        if(user?.length == 0) return [guild.ownerId];
        return user.map(x => x.user_id);
    }

    const getUsersAdmin = async () => {
        const user = await usersModel.find({role: "admin"});
        if(user?.length == 0) return [guild.ownerId];
        const usersMap = user.map(x => x.user_id);
        return usersMap;
    }

    const adminPerms  =  await getUsersAdmin();
    const licenseAcc  =  await getAllUsers();
    const customers   =  await getAllCustomers();
    
    await guild.commands.set(CommandsArray).then((cmd) => {
        const getUsers = (command) => {
            if(command == "self")          return guild.members.cache.filter(x => customers.includes(x.id));
            else if(command == "license")  return guild.members.cache.filter(x => licenseAcc.includes(x.id));
            else if(command == "product")  return guild.members.cache.filter(x => adminPerms.includes(x.id));
            else if(command == "config")   return guild.members.cache.filter(x => adminPerms.includes(x.id));
            else if(command == "users")    return guild.members.cache.filter(x => adminPerms.includes(x.id));
        };

        const fullPermissions = cmd.reduce((accumulator, x) => {
            const users = getUsers(x.name);
            if(!users) return accumulator

            const permissions = users.reduce((a, v) => {
                
                return [
                    ...a,
                    {
                        id: v.id,
                        type: "USER",
                        permission: true,
                    },
                    {
                        id: guild.id,
                        type: "ROLE",
                        permission: false,
                    }
                ]
            }, []);

            return [
                ...accumulator,
                {
                    id: x.id,
                    permissions,
                }
            ]

        }, [])
        guild.commands.permissions.set({ fullPermissions }).then(() => {
            console.log(`[${guild.name}] Permissions updated!`);
        });
    });
}