const express = require("express")
const app = express()
const cors = require("cors")
const { Sequelize,DataTypes } = require("sequelize")
const { Server } = require("socket.io")
const io = new Server(3213)

const sequelize = new Sequelize("login_qr_socket","postgres","0psqlpassword0",{
    host:"localhost",
    dialect:"postgres"
})

const Users = sequelize.define("Users",{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    username:{
        type:DataTypes.CHAR(10),
    },
    password:{
        type:DataTypes.CHAR(10),
    }
})

const QR = sequelize.define("QRCode",{
    qrcode:{
        type:DataTypes.CHAR(10),
    }
})

sequelize.sync().then().catch(e=>console.error(e))

io.on("connection",(socket)=>{
    console.log("client-connected")
})

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors())

app.get("/api/qrcode/new",async(req,res)=>{
    try {
        if ((await QR.findAll()).length!==0) {
            await QR.update({
                qrcode:Array.from({length: 10}, () => Math.random().toString(36)[2]).join('')
            })
        } else {
            await QR.create({
                qrcode:Array.from({length: 10}, () => Math.random().toString(36)[2]).join('')
            })
        }
        return res.status(200).send("OK")
    } catch (error) {
        console.error("error getqrnw",error)
        return res.status(500).json()
    }
})

app.get("/api/qrcode/",async(req,res)=>{
    try {
        const qr = await QR.findAll()
        return res.status(200).json({qr})
    } catch (error) {
        console.error("error getqr",error)
        return res.status(500).json()
    }
})

app.get("/api/user/new",async(req,res)=>{
    try {
        if ((await Users.findAll()).length!==0) {
            await Users.update({
                username:"username",
                password:"12345678"
            })
        } else {
            await Users.create({
                username:"username",
                password:"12345678"
            })
        }

        return res.status(200).send("OK")
    } catch (error) {
        console.error("error user new",error)
        return res.status(500).json()
    }
})

app.post("/api/login",async(req,res)=>{
    try {
        const { username,password } = req.body
        const user = await Users.findOne({
            where:{
                username,password
            }
        })

        if (!user) {
            return res.status(400).json()
        }

        if ((await QR.findAll()).length!==0) {
            await QR.update({
                qrcode:Array.from({length: 10}, () => Math.random().toString(36)[2]).join('')
            })
        } else {
            await QR.update({
                qrcode:Array.from({length: 10}, () => Math.random().toString(36)[2]).join('')
            })
        }

        io.on("connection",(socket)=>{
            socket.emit("login-success","Success Login")
        })

        return res.status(200).send("OK")
    } catch (error) {
        console.error("error login",error)
        return res.status(500).json()
    }
})

app.listen(3212)