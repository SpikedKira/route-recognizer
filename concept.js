
class RoutingService {
  constructor() {
    this.routes = [];
  }

  addRoute(  ) {

  }

  matchRoute( url ) {

  }
}



class RouterRoute {
  constructor( name, obj, func ) {
    this.ID = obj && obj.testID ? obj.testID : null;

    this.name = name;
    this.path = name;
    this.fn = typeof obj === 'function' ? obj : func;
    if( this.fn === undefined ) {
      this.fn = function() {};
    }
    if( typeof obj === 'object' ) {
      if( obj.path ) {
        this.path = obj.path;
      }
    }
    this.children = [];
    this.loaded = false;
  }

  getChildren() {
    if( !this.loaded ) {
      this.loadChildren();
    }
    return this.children;
  }

  // ADD route
  route( /* name, obj, func */ ) {
    this.children.push( new RouterRoute( ...arguments /* name, obj, func */ ) );
  }

  loadChildren() {
    if( !this.loaded ) {
      this.fn.call( this );
      this.loaded = true;
    }
  }
}


// fake ember router
class Router {
  constructor() {
    this.root = new RouterRoute();
  }

  // wrapper?
  map( func ) {
    func.call( this.root );
  }

  // find a url/route
  matchRoute( pathString, branch ) {
    let segments = pathString.split( '/' );
    // need to trim first and last `/` at first entrance to this recursion
    let i = 0;
    let k = 0;
    branch = branch || this.root;

    let childPath = "";


    let children = branch.getChildren();
    // iterate children looking for first segment match
    for( k = 0; k < children.length; k++ ) {
      childPath = children[k].path;
      if( childPath == segments[0] ) {
        // might not be end of pathString
        if( segments.length == 1 ) {
          return children[k];
        }
        return this.matchRoute( segments.slice(1).join('/'), children[k] );
      } else {
        // if child path starts with segment, add segments
        i = 1;
        let segBuilder = segments[0];
        while( childPath.indexOf( segBuilder ) == 0 ) {
          // if no more segments, RETURN FOUND
          // if full match recurse
          if( childPath == segBuilder ) {
            // assuming more segments exist, check children
            if( i == segments.length ) {
              return children[k];
            }
            return this.matchRoute( segments.slice(i).join('/'), children[k] );
          }
          segBuilder = segBuilder + '/' + segments[i++];
        }
      }
    }
    return false;
  }
}

// ember router usage
var router = new Router();
router.map(function() {
  this.route('company', function() {
    this.route('view', {
      path: ':company_id'
    }, function() {
      this.route('edit');
    });
    this.route('new');
  });
  this.route('employee', function() {
    this.route('view', {
      path: ':employee_id'
    }, function() {
      this.route('edit');
    });
    this.route('new');
  });
  this.route('product', function() {
    this.route('view', {
      path: ':product_id'
    }, function() {
      this.route('edit');
    });
    this.route('new');
  });


  this.route('foo/bar/waka', {testID: 1});
  this.route('failboat', {
    path: 'foo'
  }, function() {
    this.route('bar', function() {
      this.route('waka', {testID: 3});
      this.route('baz', {testID: 4});
    });
  });
  this.route('foo/bar/baz', {testID: 2});
  this.route('test/foo/bar', {testID: 5});
});


router.matchRoute( 'employee/new' );
router.matchRoute( 'test/foo/bar' );
