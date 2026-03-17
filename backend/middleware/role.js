const isManager = (req, res, next) => {
    if (req.role !== 'manager') {
      return res.status(403).json({ message: 'Managers only' });
    }
    next();
  };
  
  const isIntern = (req, res, next) => {
    if (req.role !== 'intern') {
      return res.status(403).json({ message: 'Interns only' });
    }
    next();
  };
  
  module.exports = { isManager, isIntern };