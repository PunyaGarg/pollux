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


function LikeArticle({id,likes}){
  const {user} = useAuthState(auth);

  const likesRef = doc(db,"Admin",id);
  
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
   const [searchAuthor, setSearchAuthor] = useState("");
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

  const searchBlog = async () => {
    const articleRef=collection(db,"Admin")

      var q;
      if(searchInput.length > 0 && searchAuthor.length > 0){
        q = query(articleRef, where("tags", "array-contains" , searchInput.toLowerCase()), where('author.name', "==" , searchAuthor));
      }
      else if(searchInput.length > 0){
        q = query(articleRef, where("tags", "array-contains" , searchInput.toLowerCase()));
      }
      else if(searchAuthor.length > 0){
        q = query(articleRef, where('author.name', "==" , searchAuthor));
      }
      else {
        q= query(articleRef);
      }

      console.log(q);
      onSnapshot(q,(snapshot)=>{
        const articles = snapshot.docs.map((doc)=>({
          id:doc.id,
          ...doc.data(),
        }));
        setArticles(articles);
        console.log(articles);
     });
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      setUpdated(searchInput);
      searchBlog();
    }
  };


  
   useEffect(()=>{
       const articleRef=collection(db,"Admin")
       const q=query(articleRef,where('status',"==",true));
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
       <div class="searchBar-cont">
        <input
            class="search-bar feedpage"
            type="search"
            placeholder="Search stuff by Title or Field of Study"
            id="searchInput"
          onChange={(e)=>{setSearchInput(e.target.value);}}
          onKeyDown = {handleKeyDown}
          value={searchInput}
        ></input>
        
        <button class="search-icon" type="submit" onClick={searchBlog}></button>

        </div>
        {/* <div>

        <input
          class="search-bar"
          type="text"
          placeholder="Search by Author Name..."
          id="searchBar1"
          onChange={(e)=>{setSearchAuthor(e.target.value);}}
          onKeyDown = {(e) => {if (e.key === 'Enter') {
            searchBlog();
          }}}
          value={searchAuthor}
        ></input>
        <button class="search-icon" type="submit" onClick={searchBlog}><i class="fas fa-search"></i></button>
        </div> */}

      <h3 class="feedname">
        MY FEED
      </h3>

    <div>
             {
    articles.length === 0 ?(
        <p style={{margin: 20, fontSize: 22}}>No articles found</p>
    ):(

    articles.map(({id,Title,Topic,likes,imgURL,author,link})=><div class="ApproveCard" key={id}>

    <Card class="cards"
      // sx={{
      //  maxWidth: 345,
      //   backgroundColor: "rgb(70, 43, 136, 0.4)",
      //   color: "white",
      // }}
    >
      <CardMedia component="img" height="150px" image={`${imgURL}`} alt="media" />
      
      <CardContent>
        <Typography gutterBottom variant="h5" component="div" color={"white"} font-family = { "Playsans-serif"} >
        <Link color="white" to={`/article/${id}`}>{Title}</Link>
        
        </Typography>
        {/* <Typography variant="body2" color="white">
          Author: {author.name}
        </Typography>
        <Typography variant="body2" color="white">
          Field: {Topic}
        </Typography>
         */}
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

          <TransitionModal 
          title="Comment Section" 
          button={<i class="fas fa-2x fa-comments"></i>}
          content="Unleash the power of words. Spark discussion, share your insights.">             
              <Comment id={id} currentlyLoggedInUser={user}/>
          </TransitionModal>
        {/* <p>{comments?<span>{comments.length}</span>:""}</p> */}
       
        
        
          <TransitionModal 
            title="Share"
            button={<i class='fas fa-2x fa-share'></i>}
            content="Inspire others to explore tech, share the content."
            >
              <FacebookShareButton
              url={link}>
                <FacebookIcon  logoFillColor="white" round={true}></FacebookIcon>
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
                         
           <TransitionModal 
           title="Report content ?" 
           button={<i class="fa-solid fa-2x fa-circle-exclamation"></i> } 
           content="Inappropriate content on the website can be reported and removed soon ">
          <FormControl>
      <RadioGroup
        aria-labelledby="demo-radio-buttons-group-label"
        defaultValue="female"
        name="radio-buttons-group"
        color="white"
      >
        <FormControlLabel value="female" control={<Radio />} label="Sensitive Content" onChange={(e)=>{setCat("Sensitive Content")}} />
        <FormControlLabel value="male" control={<Radio />} label="Wrong information" onChange={(e)=>{setCat("Wrong information")}}/>
        <FormControlLabel value="other" control={<Radio />} label="misleading" onChange={(e)=>{setCat("misleading")}}/>
        <FormControlLabel value="other2" control={<Radio />} label="incomplete information" onChange={(e)=>{setCat("incomplete information")}}/>
        <FormControlLabel value="other4" control={<Radio />} label="Plagarized Content" onChange={(e)=>{setCat("plagarized content")}}/>
        <FormControlLabel value="other3" control={<Radio />} label="Other" onChange={(e)=>{setCat("Technical Stuff")}}/>
      </RadioGroup>
      <Button variant="contained"
                        color="secondary"
                        sx={{ marginTop: "20px" ,marginLeft:"200px"}} 
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
 
