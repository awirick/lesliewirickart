<?php

  //response messages
  $not_human       = "Human verification incorrect.";
  $missing_content = "Please supply all information.";
  $email_invalid   = "Email Address Invalid.";
  $message_unsent  = "Message was not sent. Try Again.";
  $message_sent    = "Thanks! Your message has been sent.";

  //user posted variables
  $name = $_POST['message_name'];
  $email = $_POST['message_email'];
  $message = $_POST['message_text'];
  $human = $_POST['message_human'];
  $seed = $_POST['message_seed'];

  //php mailer variables
  $to = get_option('admin_email');
  var_dump($to);
  $subject = "Someone sent a message from ".get_bloginfo('name');
  $headers = 'From: '. $email . "rn" .
    'Reply-To: ' . $email . "rn";

  //setting up the page
  $context = Timber::get_context();
  $context['post'] = new TimberPost();

  //function to generate response
  function my_contact_form_generate_response(&$context, $type, $message){
    $context['status'] = $type;
    $context['error_message'] = $message;
  }

  //if form was submitted
  if(!$human == 0){
    if($human != 10 - $seed) {
      my_contact_form_generate_response($context, "error", $not_human);
    }
    else {

      //validate email
      if(!filter_var($email, FILTER_VALIDATE_EMAIL))
        my_contact_form_generate_response($context, "error", $email_invalid);
      else //email is valid
      {
        //validate presence of name and message
        //validate presence of name and message
        if(empty($name) || empty($message)){
          my_contact_form_generate_response($context, "error", $missing_content);
        }
        else //ready to go!
        {
          $sent = wp_mail($to, $subject, strip_tags($message), $headers);
          if($sent) my_contact_form_generate_response($context, "warning", $message_sent); //message sent!
          else my_contact_form_generate_response($context, "error", $message_unsent); //message wasn't sent

        }
      }
    }
  }
  else if ($_POST['submitted']) {
    my_contact_form_generate_response($context, "error", $missing_content);
  }

  if($context['status'] == "error") {
    $context['message_name'] = $name;
    $context['message_email'] = $email;
    $context['message_text'] = $message;
    $context['message_human'] = $human;
    $context['message_seed'] = $seed;
  }

  //only seed new page loads
  if(!$context['message_seed']){
    $context['message_seed'] = rand(1,9);
  }

  Timber::render('contact.twig', $context);
?>
