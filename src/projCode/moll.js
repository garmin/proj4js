/*******************************************************************************
NAME                            MOLLWEIDE

PURPOSE:  Transforms input longitude and latitude to Easting and
    Northing for the MOllweide projection.  The
    longitude and latitude must be in radians.  The Easting
    and Northing values will be returned in meters.

PROGRAMMER              DATE
----------              ----
D. Steinwand, EROS      May, 1991;  Updated Sept, 1992; Updated Feb, 1993
S. Nelson, EDC    Jun, 2993;  Made corrections in precision and
          number of iterations.

ALGORITHM REFERENCES

1.  Snyder, John P. and Voxland, Philip M., "An Album of Map Projections",
    U.S. Geological Survey Professional Paper 1453 , United State Government
    Printing Office, Washington D.C., 1989.

2.  Snyder, John P., "Map Projections--A Working Manual", U.S. Geological
    Survey Professional Paper 1395 (Supersedes USGS Bulletin 1532), United
    State Government Printing Office, Washington D.C., 1987.
*******************************************************************************/

proj4.Proj.moll = {

  /* Initialize the Mollweide projection
    ------------------------------------*/
  init: function() {
    //no-op
  },

  /* Mollweide forward equations--mapping lat,long to x,y
    ----------------------------------------------------*/
  forward: function(p) {

    /* Forward equations
      -----------------*/
    var lon = p.x;
    var lat = p.y;

    var delta_lon = proj4.common.adjust_lon(lon - this.long0);
    var theta = lat;
    var con = proj4.common.PI * Math.sin(lat);

    /* Iterate using the Newton-Raphson method to find theta
      -----------------------------------------------------*/
    for (var i = 0; true; i++) {
      var delta_theta = -(theta + Math.sin(theta) - con) / (1 + Math.cos(theta));
      theta += delta_theta;
      if (Math.abs(delta_theta) < proj4.common.EPSLN){
        break;
      }
      if (i >= 50) {
        proj4.reportError("moll:Fwd:IterationError");
        //return(241);
      }
    }
    theta /= 2;

    /* If the latitude is 90 deg, force the x coordinate to be "0 + false easting"
       this is done here because of precision problems with "cos(theta)"
       --------------------------------------------------------------------------*/
    if (proj4.common.PI / 2 - Math.abs(lat) < proj4.common.EPSLN){
      delta_lon = 0;
    }
    var x = 0.900316316158 * this.a * delta_lon * Math.cos(theta) + this.x0;
    var y = 1.4142135623731 * this.a * Math.sin(theta) + this.y0;

    p.x = x;
    p.y = y;
    return p;
  },

  inverse: function(p) {
    var theta;
    var arg;

    /* Inverse equations
      -----------------*/
    p.x -= this.x0;
    p.y -= this.y0;
    arg = p.y / (1.4142135623731 * this.a);

    /* Because of division by zero problems, 'arg' can not be 1.  Therefore
       a number very close to one is used instead.
       -------------------------------------------------------------------*/
    if (Math.abs(arg) > 0.999999999999){
      arg = 0.999999999999;
    }
    theta = Math.asin(arg);
    var lon = proj4.common.adjust_lon(this.long0 + (p.x / (0.900316316158 * this.a * Math.cos(theta))));
    if (lon < (-proj4.common.PI)){
      lon = -proj4.common.PI;
    }
    if (lon > proj4.common.PI){
      lon = proj4.common.PI;
    }
    arg = (2 * theta + Math.sin(2 * theta)) / proj4.common.PI;
    if (Math.abs(arg) > 1){
      arg = 1;
    }
    var lat = Math.asin(arg);
    //return(OK);

    p.x = lon;
    p.y = lat;
    return p;
  }
};