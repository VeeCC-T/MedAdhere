import React from 'react';
export default function PrivateRoute({ children, user }){
  if(!user) return <div>Please login</div>;
  return children;
}
