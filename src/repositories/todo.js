export default (db) => {
    const { TODO_COLLECTION } = process.env;
    const collection = db.collection(TODO_COLLECTION);

    async function insertOne(todo) {
        return await collection.insertOne(todo);
    }

    async function getUserTodos(userID) {
        return await collection.find({
          userID,
        });
      }
    
    async function setCompletionState(
        completionState,
        todoIdentifier,
        checkUserID
    ) {
        return await collection.findOneAndUpdate(
        {
            //incase params were set manually
            userID: checkUserID,
            todoID: todoIdentifier,
        },
        {
            $set: { completion: completionState },
        },
        {
            returnOriginal: false,
        }
    );
    }
    
    return {
        insertOne,
        getUserTodos,
        setCompletionState,
    };
};