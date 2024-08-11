import express from 'express';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import { v4 as uuidv4 } from 'uuid';
import { validateTodo, validateUser } from '../schemas/validators.js';
import auth from '../middleware/auth.js';
import { verifyToken } from '../functions/cookies.js';


dayjs.extend(utc);
const router = express.Router();

export default ({todoRepository}) => {
    // Create new todo
    router.post('/', auth, async (req, res) => {
        try {
            let session = verifyToken(req.cookies['todox-session']);

            const todoID = uuidv4();
            const created = dayjs().utc().toISOString();

            let newTodo = {
                ...req.body,
                todoID,
                userID: session.userID,
                created
            };

            if (validateTodo(newTodo)) {
                let resultTodo = await todoRepository.insertOne(newTodo);
                return res.status(201).send(resultTodo);
            }
            console.error(validateTodo.errors);
            return res.status(400).send({error: "Invalid field used."});
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({error: "Todo creation failed."});
        }
    });

    router.get("/", auth, async (req, res) => {
        try {
          let session = verifyToken(req.cookies["todox-session"]);
    
          let todoCursor = await todoRepository.getUserTodos(session.userID);
    
          const totalTodos = [];
    
          //incase the data is really really big
          await todoCursor.forEach((element) => {
            delete element._id;
            delete element.userID;
            totalTodos.push(element);
          });
    
          return res.status(201).send(totalTodos);
        } catch (err) {
          console.error(err);
          return res.status(500).send({ error: "Todo get failed." });
        }
      });
    
      router.post("/complete", auth, async (req, res) => {
        try {
          let session = verifyToken(req.cookies["todox-session"]);
    
          const body = req.body;
    
          const result = await todoRepository.setCompletionState(
            true,
            body.todoID,
            session.userID
          );
    
          if (result.value) {
            return res.status(201).send({});
          }
    
          throw new Error(
            "Tried to modify Todo that doesn't belong to" + session.userID
          );
        } catch (err) {
          console.error(err);
          return res.status(500).send({ error: "Todo set failed." });
        }
      });

    return router;
}
