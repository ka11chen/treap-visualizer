import random, json

random.seed(48763)
class node():
    def __init__(self, val:int):
        self.val=val
        self.mx=val
        # self.id=id
        self.sz=1
        self.hid=random.random()
        self.l=None
        self.r=None
    
    def pull(self):
        self.sz=1
        self.mx=self.val
        if self.l: 
            self.mx=max(self.l.mx, self.mx)
            self.sz += self.l.sz
        if self.r:
            self.mx=max(self.r.mx, self.mx)
            self.sz += self.r.sz

def merge(a:node, b:node):
    if not a or not b:
        return a or b
    if a.hid > b.hid:
        # no push
        a.r = merge(a.r, b)
        a.pull()
        return a
    else:
        b.l= merge(a, b.l)
        b.pull()
        return b

# left part has size = k
def spilt(cur: node, k:int): # -> a, b
    if not cur:
        return None, None
    # no push
    lsz = cur.l.sz if cur.l else 0
    if lsz >= k:
        a, cur.l = spilt(cur.l, k)
        cur.pull()
        return a, cur
    else:
        cur.r, b = spilt(cur.r, k - lsz - 1)
        cur.pull()
        return cur, b

def print_treap(root):
    def build_dict(node):
        if not node:
            return None
        
        ret= {
            "node_id": str(id(node)),  # 利用 id() 產生唯一標識符
            # "node_id": node.id,
            "val": node.val,
            "priority": round(node.hid, 6),  # 取小數點後 6 位讓版面更簡潔
            "range_max": node.mx,
            "left": build_dict(node.l),
            "right": build_dict(node.r)
        }
        if not node.l and node.r:
            ret["left"]={
                "node_id": ret["node_id"]+"_null",
                "isEmpty": True
            }
        elif not node.r and node.l:
            ret["right"]={
                "node_id": ret["node_id"]+"_null",
                "isEmpty": True
            }
        
        return ret
    
    vroot={
        "isVirtual": True,
        "node_id": "vroot",
        "children":[
            build_dict(root)
        ]
    }
    # 建立字典結構並轉換為縮排好的 JSON 字串
    return json.dumps(vroot, indent=4)

class Treap():
    def __init__(self):
        self.root : node | None =None

    def query(self, l, r): # root will not change
        if not self.root: raise ValueError("Tree is empty")
        if l > r: raise ValueError("l must be <= r")
        if l <= 0 or r > self.root.sz: raise ValueError("Index out of bounds")
        a, b= spilt(self.root, l-1)
        b, c= spilt(b, r-l+1)
        ans = b.mx
        merge(a, merge(b,c))
        return ans

    def insert(self, k, val): # -> new root
        current_sz = self.root.sz if self.root else 0
        if k < 0 or k > current_sz: raise ValueError("Index out of bounds")
        a,b=spilt(self.root, k)
        newnode=node(val)
        self.root = merge(a, merge(newnode, b))

    def remove(self, k):
        if not self.root: raise ValueError("Tree is empty")
        if k <= 0 or k > self.root.sz: raise ValueError("Index out of bounds")
        a,b= spilt(self.root, k-1)
        b,c= spilt(b,1)
        self.root= merge(a,c)
    
    def build(self, nodes): # nodes[i]=val
        for i in nodes:
            self.root=merge(self.root, node(i))

if __name__=='__main__':
    t = Treap()
    t.build([4,8,7,6,3])
    print(print_treap(t.root))
    t.remove(2)
    t.remove(3)
    t.insert(0,100)
    print(t.query(2,4))
    print(print_treap(t.root))