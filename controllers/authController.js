const {users} = require('../models/user');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'Ovargas';

exports.register = async (req,res) => {
    const {username, password} = req.body;
    const existingUser = users.find( (u) => {u.username === username});
    if(existingUser){
        return res.status(400).json({message: "El usuario ya existe"});
    }
    const hashedPassword = await bcrypt.hash(password,10);
    const newUser = {
        id: users.length + 1,
        username: username,
        password: hashedPassword
    }

    users.push(newUser);
    res.status(201).json({message: 'Usuario registrado correctamente'});
}

exports.login = async (req,res) => {
    const {username, password} = req.body;
    const user = users.find(u => u.username === username);

    if(!user || !(await bcrypt.compare(password, user.password))){
        return res.status(401).json({message: 'Credenciales incorrectas'});
    }

    const token = jwt.sign({
        userId: user.id,
        username: user.username
    }, SECRET_KEY, {expiresIn:"1h"});

    res.status(200).json({ token });
}