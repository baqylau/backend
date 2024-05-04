const Organizations = require("../model/Organizations");

module.exports =  async (socket) => {
    
    const orgId = socket.handshake.query.orgId
    console.log(socket.handshake.query)
    setInterval(async () => {
        const organization = await Organizations.findById(orgId).populate({path:"cars",populate: {
            path: "notifications"
        }})
        if(!organization) return
        let allNotifications = [];
      
        organization.cars.forEach(car => {
          allNotifications = allNotifications.concat(car.notifications);
        });
      
        allNotifications.sort((a, b) => {
          return new Date(a.createdAt) - new Date(b.createdAt);
        });
        
        socket.emit("GET_NOTIFICATIONS", allNotifications);
        return socket.emit("GET_CARS", organization.cars)
    }, 2000);
  }