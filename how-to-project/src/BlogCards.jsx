import React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useState ,useEffect} from "react";
import { collection, query, where ,onSnapshot,arrayUnion,arrayRemove,doc,updateDoc,addDoc} from "firebase/firestore";
import { auth, db } from "./Firebase/firebase";
import useAuthState from "./Firebase/hooks";
import { UserAuth } from "./Firebase/AuthContext";
import TransitionModal from './Elements/Modal';
import { Link } from "react-router-dom";
import Comment from "./Elements/Comment";
import { FacebookIcon, FacebookShareButton, LinkedinIcon, LinkedinShareButton, TwitterIcon, TwitterShareButton, WhatsappIcon, WhatsappShareButton  } from "react-share";
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';


function LikeArticle({id,likes,Title}){
  const {user} = useAuthState(auth);

  const likesRef = doc(db,"Blogs",id);
  
  const handleLike = ()=>{

    const userRef = doc(db, "users", user.email);
      if(likes?.includes(user.uid)){
          updateDoc(likesRef,{
              likes:arrayRemove(user.uid),
          }).then(()=>{
              console.log("unliked");
          }).catch((e)=>{
              console.log(e);
          });

          // updating user collection
          updateDoc(userRef,{
            Liked:arrayRemove(id),
        }).then(()=>{
          console.log("Unliked");
        }).catch((e)=>{
            console.log(e);
        });
      }
      else{
          updateDoc(likesRef,{
              likes:arrayUnion(user.uid)
          }).then(()=>{
              console.log("liked");
          }).catch((e)=>{
              console.log(e);
          });


          // updating user collection
          updateDoc(userRef,{
            Liked:arrayUnion(id),
        }).then(()=>{
          console.log("liked");
        }).catch((e)=>{
            console.log(e);
        });
    
      }
  
  }
  return(
      <div>
         <Button
          size="small"
          sx={{ backgroundColor: "none", color: "#c69af6" }}
        >
          <i class="fas fa-2x fa-heart"  onClick={handleLike}></i>
        </Button>
      </div>
  )
}
export default function BlogCard() { 
   // const classes = useStyles();
   const [searchInput, setSearchInput] = useState("");
   const [updated, setUpdated] = useState('');
   const [category,setCat]=useState("");
   const reportRef=collection(db,"Report");
  
  const handleReport=async (e)=>{    
    e.preventDefault();
    if(category===""){
      alert("choose any one to report");
      return false;
    }else{
    await addDoc(reportRef,{
        category,
        author:{name:auth.currentUser.displayName,id:auth.currentUser.uid},
        
    }).then(()=>{alert("Content Reported")}).catch(err=>{alert(err.message)});

    setCat("");
}}

   const [articles,setArticles]=useState([]);
   const {user} = useAuthState(auth);

  const searchBlog = () => {
    const articleRef=collection(db,"Blogs")
    var q;
      
      console.log(searchInput);
      if (searchInput.length > 0) {
        q=query(articleRef, where("title_lower", "==" , searchInput.toLowerCase()));
      }

      else {
        q=query(articleRef);
      }

      onSnapshot(q,(snapshot)=>{
        const articles = snapshot.docs.map((doc)=>({
          id:doc.id,
          ...doc.data(),
        }));
        setArticles(articles);
        console.log(articles);
     })
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      setUpdated(searchInput);
      searchBlog();
    }
  };


  
   useEffect(()=>{
       const articleRef=collection(db,"Blogs")
       const q=query(articleRef);
       onSnapshot(q,(snapshot)=>{
           const articles = snapshot.docs.map((doc)=>({
               id:doc.id,
               ...doc.data(),
           }));
           setArticles(articles);
           console.log(articles);
       })
   },[]);

  return (
  <>
    <div>
        <input
          class="search-bar"
          type="text"
          placeholder="Search"
          id="searchBar"
          onChange={(e)=>{setSearchInput(e.target.value);}}
          onKeyDown = {handleKeyDown}
          value={searchInput}
        ></input>
        <button class="search-icon" type="submit" onClick={searchBlog}><i class="fas fa-search"></i></button>
      </div>


    <div>
             {
    articles.length === 0 ?(
        <p>no articles found</p>
    ):(
    articles.map(({id,Title,Topic,userId,likes,comment,imgURL,link})=><div class="BlogCard" key={id}>
    <Card
      sx={{
        maxWidth: 345,
        backgroundColor: "rgb(70, 43, 136, 0.4)",
        color: "white",
      }}
    >
      <CardMedia component="img" height="140" image={`${imgURL}`} alt="media" />
      
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
        <Link to={`/article/${id}`}>{Title}</Link>
        </Typography>
        <Typography variant="body2" color="white">
          {Topic}
        </Typography>
        
      </CardContent>
      
      <CardActions>
        <div className="mt-20">
        {user?<LikeArticle
            id={id}
            likes={likes}
            />: <Button
            size="small"
            sx={{ backgroundColor: "none", color: "#c69af6" }}
          >
             <i class="fa-2x fa-regular fa-heart"></i>
          </Button>}
            <p>{likes?<span>{likes.length}</span>:""}</p></div>

          <TransitionModal button={<i class="fas fa-2x fa-comments"></i>}>             
              <Comment id={id} currentlyLoggedInUser={user}/>
          </TransitionModal>
        {/* <p>{comments?<span>{comments.length}</span>:""}</p> */}
       
        
        
          <TransitionModal 
            title="Share via"
            button={<i class='fas fa-2x fa-share'></i>}
            >
              <FacebookShareButton
              url={link}>
                <FacebookIcon logoFillColor="white" round={true}></FacebookIcon>
              </FacebookShareButton>
              <WhatsappShareButton
              title="sharing content"
              url={link}>
                <WhatsappIcon logoFillColor="white" round={true}></WhatsappIcon>
              </WhatsappShareButton>
              <TwitterShareButton
              url={link}>
                <TwitterIcon logoFillColor="white" round={true}></TwitterIcon>
              </TwitterShareButton>
              <LinkedinShareButton
              url={link}>
              <LinkedinIcon logoFillColor="white" round={true}></LinkedinIcon>
              </LinkedinShareButton>
          </TransitionModal>
                         
           <TransitionModal title="report content ?" button={<i class="fa-solid fa-2x fa-circle-exclamation"></i> } content="lorem ipsum">
          <FormControl>
      <RadioGroup
        aria-labelledby="demo-radio-buttons-group-label"
        defaultValue="female"
        name="radio-buttons-group"
      >
        <FormControlLabel value="female" control={<Radio />} label="Sensitive Content" onChange={(e)=>{setCat("Sensitive Content")}} />
        <FormControlLabel value="male" control={<Radio />} label="Wrong information" onChange={(e)=>{setCat("Wrong information")}}/>
        <FormControlLabel value="other" control={<Radio />} label="misleading" onChange={(e)=>{setCat("misleading")}}/>
        <FormControlLabel value="other2" control={<Radio />} label="incomplete information" onChange={(e)=>{setCat("incomplete information")}}/>
        <FormControlLabel value="other3" control={<Radio />} label="Other" onChange={(e)=>{setCat("Technical Stuff")}}/>
      </RadioGroup>
      <Button variant="contained"
                        color="secondary"
                        sx={{ marginTop: "20px" }} 
                        onClick={handleReport}>Submit</Button>
    </FormControl>
                      
            
          </TransitionModal>
      </CardActions>
    </Card>
    
  </div>)
    )
}
</div>
</>
)}
 
