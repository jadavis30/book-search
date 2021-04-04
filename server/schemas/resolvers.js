const { AuthenticationError } = require("apollo-server-errors");
const { User, Book } = require("../models");
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
      me: async (parent, args, context) => {
            if(context.user) {
                const userData = await User.findOne({ _id: context.user._id})
                    .select('-__v -password');
                return userData
            }
            throw new AuthenticationError('User not logged in.')
      },
      users: async () => {
        return User.find()
            .select('-__v -password');
      },
      
    },

    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
            if(!user) {
                throw new AuthenticationError('Incorrect credentials.');
            }
            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials.')
            }
            const token = signToken(user);
            return { token, user };
        },
        saveBook: async (parent, {book}, context) => {
            if (context.user) {
                const updatedUser = await User.findByIdAndUpdate(
                    {_id: context.user._id},
                    {$addToSet: {savedBooks: book } },
                    { new: true }
                );
                return updatedUser;
            };
            throw new AuthenticationError('You must be logged in.');
        }
    }
  };
  
  module.exports = resolvers;