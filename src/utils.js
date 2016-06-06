export function add(dict, key, val) {
  if (!val) return;
  
  if (dict[key]) {
    if (!Array.isArray(dict[key]))
      dict[key] = [dict[key]];
    
    dict[key].push(val);
  } else {
    dict[key] = val;
  }
}

export function setKey(root, path, value) {
  if (!value) return;
  
  let node = root;
  for (let key of path.slice(0, -2)) {
    if (!node[key]) {
      node[key] = {};
    }
    
    node = node[key];
  }
  
  if (path.length > 1) {
    let p = path[path.length - 2];
    let n = node[p];
    if (n && (Array.isArray(node[p]) || n[path[path.length - 1]])) {
      if (!Array.isArray(node[p]))
        n = node[p] = [node[p]];
      
      if (n[n.length - 1][path[path.length - 1]])
        n.push({});
      
      if (typeof n[n.length - 1] !== 'object') {
        n[n.length - 1] = {
          _: n[n.length - 1]
        };
      }
      
      n[n.length - 1][path[path.length - 1]] = value;
    } else {
      if (!node[p])
        node[p] = {};
      node[p][path[path.length - 1]] = value;
    }
    
    node = node[p];
  } else {
    add(root, path[0], value);
  }
  
  // add(node, path[path.length - 2], {});
  // add(node[path[path.length - 2]], node[path[path.length - 1]], value);
}

export function parseDimension(size) {
  return parseInt(size, 10) || undefined;
}

export function get(item) {
  if (Array.isArray(item)) {
    return item[0];
  }
  
  return item;
}
