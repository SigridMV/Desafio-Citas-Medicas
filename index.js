import express from "express";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import _ from "lodash";
import chalk from "chalk";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para imprimir por consola la lista de usuarios 
const logUsers = (users) => {
    const [mujeres, hombres] = _.partition(users, (user) => user.gender === "female");
  
    console.log(chalk.blue.bgWhite.bold("Lista de Usuarios:"));
    console.log(chalk.bgBlue.underline("Mujeres:"));
    mujeres.forEach((user, index) => {
      console.log(chalk.magenta(`${index + 1}.`) + `Nombre: ${user.Nombre} - Apellido: ${user.Apellido} - ID: ${user.ID.slice(0, 6)} - Timestamp: ${moment(user.Timestamp).format("MMMM Do YYYY, hh:mm:ss A")}`);
    });
  
    console.log(chalk.bgBlue.underline("Hombres:"));
    hombres.forEach((user, index) => {
      console.log(chalk.cyan(`${index + 1}.`) +  `Nombre: ${user.Nombre} - Apellido: ${user.Apellido} - ID: ${user.ID.slice(0, 6)} - Timestamp: ${moment(user.Timestamp).format("MMMM Do YYYY, hh:mm:ss A")}`);
    });
  };

// Middleware para registrar usuarios y agregar ID único y timestamp
const registerUser = async (req, res, next) => {
    try {
      const users = req.app.locals.users || [];
      const newUsers = await getRandomUsers();
      const formattedUsers = newUsers.map((user) => ({
        Nombre: user.name.first,
        Apellido: user.name.last,
        ID: uuidv4(),
        Timestamp: moment().toISOString(),      
        gender: user.gender,
      }));
      req.app.locals.users = users.concat(formattedUsers);
      next();
    } catch (error) {
      next(error);
    }
  };
// Función para obtener datos de usuarios aleatorios de la API Random User usando Axios
const getRandomUsers = async () => {
  try {
    const response = await axios.get("https://randomuser.me/api/?results=10");
    return response.data.results;
  } catch (error) {
    console.error("Error al obtener usuarios aleatorios:", error);
    return [];
  }
};

// Ruta para registrar usuarios
app.get("/", registerUser, (req, res) => {
  const users = req.app.locals.users;
  const groupedUsers = _.groupBy(users, "gender");
  logUsers(users);
  res.json(groupedUsers);
});

// Iniciar el servidor con Nodemon
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

export default app;
